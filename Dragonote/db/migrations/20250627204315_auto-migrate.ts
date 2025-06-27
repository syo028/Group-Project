import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('comment'))) {
    await knex.schema.createTable('comment', table => {
      table.increments('id')
      table.integer('post_id').unsigned().notNullable().references('post.id')
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.text('content').notNullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('comment')
}
