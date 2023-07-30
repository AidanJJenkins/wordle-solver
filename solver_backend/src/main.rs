use dotenv::dotenv;
use sqlx::PgPool;
use std::env;
use std::net::TcpListener;
use env_logger::Env;
use wordle_solver::startup::run;


#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    dotenv().ok();
    let _conn_str = match env::var("DATABASE_URL") {
        Ok(url) => url,
        Err(e) => {
            panic!("Failed to read DATABASE_URL: {}", e);
        }
    };

    let connection_pool = PgPool::connect(&_conn_str)
        .await
        .expect("Failed to connect to database");

    let listener = TcpListener::bind("127.0.0.1:8000").expect("failed to bind random port");
    run(listener, connection_pool)?.await
}
