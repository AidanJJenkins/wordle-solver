pub mod handlers;
pub mod models;
pub mod utils;

use handlers::users::user_routes;
use handlers::game::game_routes;
use actix_cors::Cors;
use actix_web::middleware::Logger;
use actix_web::{http::header, web::Data, App, HttpServer, web};
use dotenv::dotenv;
use std::env;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

// This struct represents state
pub struct AppState {
    db: Pool<Postgres>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    dotenv().ok();
    env_logger::init();

    let database_url = match env::var("DATABASE_URL") {
        Ok(url) => url,
        Err(e) => {
            panic!("Failed to read DATABASE_URL: {}", e);
        }
    };

    let pool = match PgPoolOptions::new()
    .max_connections(10)
    .connect(&database_url)
    .await
{
    Ok(pool) => {
        println!("Connection to the database is successful!");
        pool
    }
    Err(err) => {
        println!("Failed to connect to the database: {:?}", err);
        std::process::exit(1);
    }
};
    println!("Server started successfully");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
            ])
            .supports_credentials();
        App::new()
            .app_data(Data::new(AppState {db: pool.clone()}))
            .service(
                web::scope("/api")
                    .configure(user_routes)
                    .configure(game_routes)
            )
            //.configure(user_routes)
            .wrap(cors)
            .wrap(Logger::default())
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
