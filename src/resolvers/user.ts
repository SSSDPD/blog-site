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
import { MyContext } from "../types";
import { COOKIE_NAME } from "../constants";

@InputType()
class RegisterUserArgument {
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
  async me(@Ctx() ctx: MyContext) {
    if (!ctx.req.session.userId) {
      return null;
    }

    const user = await ctx.em.findOne(User, { id: ctx.req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async registerUser(
    @Arg("register_args") register_args: RegisterUserArgument,
    @Ctx() ctx: MyContext
  ): Promise<UserResponse> {
    if (register_args.password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    if (register_args.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    const hashedPass = await argon2.hash(register_args.password);

    const user = ctx.em.create(User, {
      email: register_args.email,
      password: hashedPass,
      firstName: register_args.firstName,
      lastName: register_args.lastName,
      username: register_args.username,
    });
    try {
      await ctx.em.persistAndFlush(user);
    } catch (err) {
      if (
        err.code === "23505" ||
        err.detail.includes("already exists") ||
        err.name === "UniqueConstraintViolationException"
      ) {
        if (err.constraint === "user_email_unique") {
          return {
            errors: [
              {
                field: "Email",
                message: "Email Aready Exist",
              },
            ],
          };
        }
        if (err.constraint === "user_username_unique") {
          return {
            errors: [
              {
                field: "Username",
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
    const user = await ctx.em.findOne(User, {
      username: register_args.username,
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
