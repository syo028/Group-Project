import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw('DELETE FROM post')
}


export async function down(knex: Knex): Promise<void> {
}

