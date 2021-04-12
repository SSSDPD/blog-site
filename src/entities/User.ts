import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User{
  @Field()
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ unique: true })
  email!: string;

  @Field()
  @Property({ unique: true })
  username!: string;

  @Property()
  password!:  string;

  @Field()
  @Property()
  firstName: string;

  @Field()
  @Property()
  lastName: string;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();
}