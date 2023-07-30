use std::net::TcpListener;
use actix_web::{web, http::header, App, HttpServer, dev::Server};
use crate::handlers::{users::{create_user,
    get_all_users,
    update_user,
    get_user_by_id,
    update_password,
    login_user,
    delete_user,
    revoke_token,
    refresh_tokens,
    check_access}, game::find_letters};
use sqlx::PgPool;
use actix_web::middleware::Logger;
use actix_cors::Cors;

pub fn run(listener: TcpListener, db_pool: PgPool) -> Result<Server, std::io::Error> {
    let db_pool = web::Data::new(db_pool);
    let server = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE", "PUT"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
            ])
            .supports_credentials();
        App::new()
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .route("/register", web::post().to(create_user))
            .route("/get_users", web::get().to(get_all_users))
            .route("/get_user/{id}", web::get().to(get_user_by_id))
            .route("/update_user/{id}", web::put().to(update_user))
            .route("/update_password/{id}", web::put().to(update_password))
            .route("/delete/{id}", web::delete().to(delete_user))
            .route("/login", web::post().to(login_user))
            .route("/revoke_token", web::post().to(revoke_token))
            .route("/refresh_token", web::post().to(refresh_tokens))
            .route("/check_access", web::post().to(check_access))
            .route("/solve", web::post().to(find_letters))
            .wrap(cors)
            .app_data(db_pool.clone())
    })
    .listen(listener)?
    .run();
    Ok(server)
}
