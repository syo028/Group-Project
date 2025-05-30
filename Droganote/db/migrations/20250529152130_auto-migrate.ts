import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('posting'))) {
    await knex.schema.createTable('posting', table => {
      table.increments('id')
      table.integer('user_id').notNullable()
      table.text('title').notNullable()
      table.text('description').notNullable()
      table.text('likes').notNullable()
      table.text('comments').notNullable()
      table.text('tags').notNullable()
      table.text('photos').notNullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('posting')
}
