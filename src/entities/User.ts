import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User{
  @Field(()=>ID)
  @PrimaryKey()
  _id!: number;

  @Field()
  @Property({ type: "text" })
  email!: string;

  @Property({ type: "text" })
  password!:  string;

  @Field()
  @Property({ type: "text" })
  firstName: string;

  @Field()
  @Property({type: "text"})
  lastName: string;
}