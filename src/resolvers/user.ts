import argon2 from "argon2";
import { User } from "../entities/User";
import {
  Resolver,
  Mutation,
  Arg,
  Ctx,
  Field,
  InputType,
  ObjectType,
  Query,
} from "type-graphql";
import { v4 } from "uuid";
import { MyContext } from "../types";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validate";
import { sendEmail } from "../utils/sendEmail";
import { getConnection } from "typeorm";

@InputType()
export class RegisterUserArgument {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  username: string;
}

@InputType()
class LoginUserArgument {
  @Field()
  password: string;

  @Field()
  username: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token Expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exist",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) return true;

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60
    ); // 1hour

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Mutation(() => UserResponse)
  async registerUser(
    @Arg("register_args") register_args: RegisterUserArgument,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(register_args);
    if (errors) return { errors };
    const hashedPass = await argon2.hash(register_args.password);
    let user;
    try {
      // User.create({email: register_args.email,
      //   password: hashedPass,
      //   firstName: register_args.firstName,
      //   lastName: register_args.lastName,
      //   username: register_args.username,}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: register_args.email,
          password: hashedPass,
          firstName: register_args.firstName,
          lastName: register_args.lastName,
          username: register_args.username,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      console.log("error : ", err);

      if (
        err.code === "23505" ||
        err.detail.includes("already exists") ||
        err.name === "UniqueConstraintViolationException"
      ) {
        if (err.constraint === "user_email_unique") {
          return {
            errors: [
              {
                field: "email",
                message: "Email Aready Exist",
              },
            ],
          };
        }
        if (err.constraint === "user_username_unique") {
          return {
            errors: [
              {
                field: "username",
                message: "Username Aready Exist. Try another one ;)",
              },
            ],
          };
        }
      }
    }
    ctx.req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => UserResponse)
  async loginUser(
    @Arg("register_args") register_args: LoginUserArgument,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: { username: register_args.username },
    });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "I did not find anyone with that username :(",
          },
        ],
      };
    }

    const verifyPassword = await argon2.verify(
      user.password,
      register_args.password
    );
    if (!verifyPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password",
          },
        ],
      };
    }
    ctx.req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  logoutUser(@Ctx() ctx: MyContext) {
    return new Promise((res) =>
      ctx.req.session.destroy((err) => {
        ctx.res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);

          res(false);
          return;
        }
        res(true);
      })
    );
  }
}
