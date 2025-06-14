import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // 創建評論表
  await knex.schema.createTable('comment', table => {
    table.increments('id').primary()
    table
      .integer('post_id')
      .notNullable()
      .references('post.id')
      .onDelete('CASCADE')
    table
      .integer('user_id')
      .notNullable()
      .references('user.id')
      .onDelete('CASCADE')
    table.text('content').notNullable()
    table.integer('created_at').notNullable()
    table.integer('updated_at').notNullable()
  })

  // 創建點讚表
  await knex.schema.createTable('like', table => {
    table.increments('id').primary()
    table
      .integer('post_id')
      .notNullable()
      .references('post.id')
      .onDelete('CASCADE')
    table
      .integer('user_id')
      .notNullable()
      .references('user.id')
      .onDelete('CASCADE')
    table.integer('created_at').notNullable()
    table.unique(['post_id', 'user_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('like')
  await knex.schema.dropTable('comment')
}
