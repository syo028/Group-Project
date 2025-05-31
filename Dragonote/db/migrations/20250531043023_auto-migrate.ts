import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('post'))) {
    await knex.schema.createTable('post', table => {
      table.increments('id')
      table.string('username', 32).nullable()
      table.integer('user_id').unsigned().nullable().references('user.id')
      table.text('content').notNullable()
      table.integer('like_count').notNullable()
      table.integer('comment_count').notNullable()
      table.text('photo_url').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('response'))) {
    await knex.schema.createTable('response', table => {
      table.increments('id')
      table.string('username', 32).nullable()
      table.integer('user_id').unsigned().nullable().references('user.id')
      table.text('content').notNullable()
      table.datetime('created_at').notNullable()
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('response')
  await knex.schema.dropTableIfExists('post')
}
