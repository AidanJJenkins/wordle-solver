use serde::Deserialize;
#[derive(Debug, Deserialize)]
pub struct RequestLetters {
    pub correct: String,
    pub incorrect: String,
    pub exact: String,
}
