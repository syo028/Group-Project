import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  {
    // alter column (post.photo_url) to be nullable

    let post_rows = await knex.select('*').from('post')

    await knex.schema.dropTable('post')

    if (!(await knex.schema.hasTable('post'))) {
      await knex.schema.createTable('post', table => {
        table.increments('id')
        table.string('username', 32).nullable()
        table.integer('user_id').unsigned().nullable().references('user.id')
        table.text('description').notNullable()
        table.text('content').notNullable()
        table.text('title').notNullable()
        table.text('tags').notNullable()
        table.integer('like_count').notNullable()
        table.integer('comment_count').notNullable()
        table.text('slug').nullable()
        table.text('photo_url').nullable()
        table.timestamps(false, true)
      })
    }

    for (let row of post_rows) {
      await knex.insert(row).into('post')
    }
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  {
    // alter column (post.photo_url) to be non-nullable

    let post_rows = await knex.select('*').from('post')

    await knex.schema.dropTable('post')

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

    for (let row of post_rows) {
      await knex.insert(row).into('post')
    }
  }
}
