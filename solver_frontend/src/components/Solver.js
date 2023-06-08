import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import NavBar from './Navbar';
import WordList from './WordList';
import axios from 'axios'
import { Col, Form, Button, FormGroup, Label, Input, Row, } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

function Solver() {
  const navigate = useNavigate()

  let token = localStorage.getItem('token')
  useEffect(() => {
    if (!token) {
      console.log("no token")
      navigate("/login");
    }
  },)

  let initialValues = {
    correct: '',
    incorrect: '',
    exact: ''
  }

  let [letterForm, setLetterForm] = useState(initialValues)
  let [words, setWords] = useState([])

  function handleChange(e) {
    const { name, value } = e.target
    setLetterForm({ ...letterForm, [name]: value })
    console.log(letterForm)
  }

  const handleLogout = () => {
    axios.post('http://localhost:8000/api/users/revoke_token', { token: token })
      .then((res) => {
        localStorage.removeItem('token');
        navigate('/login')
        console.log(res.status)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function handleSubmit(e){
    e.preventDefault()
     axios.post('http://localhost:8000/api/game/general-letters', letterForm)
      .then((res) => {
        console.log(res.data)
        setWords(res.data)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div>
    <NavBar handleLogout={handleLogout} />
    <div class="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh'  }}>
      <Col md="6">
        <h2 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh'}}>Solve your wordle</h2>
        <Form onSubmit={e => handleSubmit(e)}>
          <FormGroup>
            <Label for="correct letters in correct positions">
              Green Letters:
            </Label>
            <Input
              id="exact"
              value={letterForm.pos} 
              onChange={e => handleChange(e)} 
              name="exact"
              type="exact"
            />
          </FormGroup>
          <FormGroup>
            <Label for="correct letters">
              Yellow letters: 
            </Label>
            <Input
              id="correct"
              onChange={e => handleChange(e)} 
              value={letterForm.correct} 
              name="correct"
              type="correct"
            />
          </FormGroup>
          <FormGroup>
            <Label for="incorrect">
              Grey letters:
            </Label>
            <Input
              id="incorrect"
              onChange={e => handleChange(e)} 
              value={letterForm.incorrect} 
              name="incorrect"
              type="incorrect"
            />
          </FormGroup>
          <Row>
            <Col>
              <Button color='primary' outline class="submit" type="submit">
                Find words
              </Button>
            </Col>
          </Row>
        </Form>
      <WordList words={words} />
      </Col>
    </div>
    </div>
  );
}

export default Solver;
