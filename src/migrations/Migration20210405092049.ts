import { Migration } from '@mikro-orm/migrations';

export class Migration20210405092049 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("_id" serial primary key, "email" text not null, "password" text not null, "first_name" text not null, "last_name" text not null);');
  }

}
