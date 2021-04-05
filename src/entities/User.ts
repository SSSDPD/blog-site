import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class User{
  @PrimaryKey()
  _id!: number;

  @Property({ type: "text" })
  email!: string;

  @Property({ type: "text" })
  password!:  string;

  @Property({ type: "text" })
  firstName: string;

  @Property({type: "text"})
  lastName: string;
}