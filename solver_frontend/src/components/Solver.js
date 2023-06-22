import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from './Navbar'
import WordList from './WordList'
import axios from 'axios'
import {  Alert, Col, Form, Button, FormGroup, Label, Input, Row, } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { useCookies } from 'react-cookie';

function Solver() {
  const navigate = useNavigate()
  const [cookies] = useCookies(['refresh_token']);

  let initialValues = {
    correct: "",
    incorrect: "",
  }

  let initialPosLetter ={
    first: "",
    second: "",
    third: "",
    fourth: "",
    fifth: "",
  }

  const [disabled, setDisabled] = useState(false)
  let [exactForm, setExactForm] = useState(initialPosLetter)
  let [posLetter, setPosLetter] = useState("")
  let [letterForm, setLetterForm] = useState(initialValues)
  let [words, setWords] = useState([])
  let [conflicting, setConflicting] = useState(false)
  let [generalSpecial, setGeneralSpecial] = useState(false)
  let [exactSpecial, setExactSpecial] = useState(false)
  let [exactConf, setExactConf] = useState(false)

  let token = localStorage.getItem('access-token')

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/api/users/check_access",
          { token }
        );
        if (response.status === 401) {
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();    
  },)

  useEffect(() => {
    const correctLetters = letterForm.correct.toLowerCase();
    const incorrectLetters = letterForm.incorrect.toLowerCase();

    const hasConflictingLetters = [...correctLetters].some(letter => incorrectLetters.includes(letter));
    const hasInvalidCharacters = /[0-9~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/.test(correctLetters + incorrectLetters);

    setDisabled(hasConflictingLetters || hasInvalidCharacters);
    setConflicting(hasConflictingLetters);
    setGeneralSpecial(hasInvalidCharacters)
  },[letterForm] )

  useEffect(() => {
    let values = Object.values(exactForm)
    let updated = ""
    let hasInvalidCharacters = false
    let hasConflicting = false

    for (let i = 0; i < values.length; i++){
      if (values[i] === "" ){
        updated += "_"
      } else {
        updated += values[i]
        if (/[0-9~`!@#$%^&*()_+={}[\]|\\:;"'<>,.?/]/.test(values[i])) {
          hasInvalidCharacters = true;
        } if (letterForm.incorrect.includes(values[i])){
          hasConflicting = true
        }
      }
    }
    setPosLetter(updated)

    setDisabled(hasInvalidCharacters || hasConflicting)
    setExactSpecial(hasInvalidCharacters)
    setExactConf(hasConflicting)

  }, [exactForm, letterForm.incorrect])

  const handleChange = e => {
    e.target.id !== "general"
    ? setExactForm({ ...exactForm, [e.target.name]: e.target.value})
    : setLetterForm({ ...letterForm, [e.target.name]: e.target.value})
  }


  function handleSubmit(e){
    e.preventDefault()
    let yellow = letterForm.correct
    let grey = ""
    letterForm.incorrect === "" ? grey = "_" : grey = letterForm.incorrect
     axios.post('http://localhost:8080/api/game/general-letters', {correct: yellow, incorrect: grey, exact: posLetter},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    )
      .then((res) => {
        console.log(res.data)
        setWords(res.data)
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  
  async function refreshAccessToken() {
    try {
      let refreshToken = cookies.refresh_token;

      let response = await axios.post('http://localhost:8080/api/users/get_new_tokens', {
        token: refreshToken
      });
      console.log(response)

      let accessToken = response.data.access;

      return accessToken;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  axios.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const accessToken = await refreshAccessToken(); // function to get a new access token using the refresh token
        window.localStorage.setItem('access-token', accessToken);
        return axios(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  const handleClear = () => {
    setExactForm(initialPosLetter)
    setLetterForm(initialValues)
    setWords([]) 
  }

  return (
    <div>
    <NavBar />
    <div class="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop:"15vh", maxHeight: '90vh'}}>
      <Col md="6">
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh'}}>Get to solving!</h2>
        <Form autocomplete="off" onSubmit={e => handleSubmit(e)}>
          <FormGroup>
            <Label for="correct letters in correct positions">
              Green Letters:
            </Label>
              <Row>
                <Col>
                  <Input
                    maxLength={1}
                    type="text"
                    name="first"
                    value={exactForm.first} 
                    onChange={e => handleChange(e)} 
                  />
                </Col>
                <Col>
                  <Input
                    maxLength={1}
                    type="text"
                    name="second"
                    value={exactForm.second} 
                    onChange={e => handleChange(e)} 
                  />
                </Col>
                <Col>
                  <Input
                    maxLength={1}
                    type="text" 
                    name="third"
                    value={exactForm.third} 
                    onChange={e => handleChange(e)} 
                  />
                </Col>
                <Col>
                  <Input
                    maxLength={1}
                    type="text"
                    name="fourth"
                    value={exactForm.fourth} 
                    onChange={e => handleChange(e)} 
                  />
                </Col>
                <Col>
                  <Input
                    maxLength={1}
                    type="text"
                    name="fifth"
                    value={exactForm.fifth} 
                    onChange={e => handleChange(e)} 
                  />
                </Col>
            </Row>
          </FormGroup>
          <FormGroup>
            <Label for="correct letters">
              Yellow letters: 
            </Label>
            <Input
              id="general"
              onChange={e => handleChange(e)} 
              value={letterForm.correct} 
              name="correct"
            />
          </FormGroup>
          <FormGroup>
            <Label for="incorrect letters">
              Grey letters:
            </Label>
            <Input
              id="general"
              onChange={e => handleChange(e)} 
              value={letterForm.incorrect} 
              name="incorrect"
            />
          </FormGroup>
          {
            conflicting ? <Alert color="danger">Yellow letters can not also be grey letters!</Alert> : null
          }
          {
            generalSpecial ? <Alert color="danger">Only letters are allowed!</Alert> : null
          }
          {
            exactConf ? <Alert color="danger">Green letters can not also be grey letters!</Alert> : null
          }
          {
            exactSpecial ? <Alert color="danger">Only letters are allowed!</Alert> : null
          }
          <Row>
            <Col>
              <Button color='primary' class="submit" type="submit" disabled={disabled}>
                Find words
              </Button>
            </Col>
            <Col className="d-flex justify-content-end">
              <Button color='danger' onClick={handleClear}>
                Clear 
              </Button>
            </Col>
          </Row>
        </Form>
        {
          words.length > 0 && <WordList words={words} />
        }
      </Col>
    </div>
    </div>
  );
}

export default Solver;
