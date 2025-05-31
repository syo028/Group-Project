import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('post'))) {
    await knex.schema.createTable('post', table => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.text('title').notNullable()
      table.text('description').notNullable()
      table.text('photo_url').nullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('post_like'))) {
    await knex.schema.createTable('post_like', table => {
      table.increments('id')
      table.integer('post_id').unsigned().notNullable().references('post.id')
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.integer('created_at').notNullable()
    })
  }

  if (!(await knex.schema.hasTable('post_comment'))) {
    await knex.schema.createTable('post_comment', table => {
      table.increments('id')
      table.integer('post_id').unsigned().notNullable().references('post.id')
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.text('content').notNullable()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('post_tag'))) {
    await knex.schema.createTable('post_tag', table => {
      table.increments('id')
      table.text('name').notNullable().unique()
      table.timestamps(false, true)
    })
  }

  if (!(await knex.schema.hasTable('post_tag_relation'))) {
    await knex.schema.createTable('post_tag_relation', table => {
      table.integer('post_id').unsigned().notNullable().references('post.id')
      table.integer('tag_id').unsigned().notNullable().references('post_tag.id')
      table.key('PRIMARY').notNullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('post_tag_relation')
  await knex.schema.dropTableIfExists('post_tag')
  await knex.schema.dropTableIfExists('post_comment')
  await knex.schema.dropTableIfExists('post_like')
  await knex.schema.dropTableIfExists('post')
}
