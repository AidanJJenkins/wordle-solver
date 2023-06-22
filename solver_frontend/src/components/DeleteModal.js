import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

function DeleteModal(props) {
  let { decodedId } = props
  let navigate = useNavigate()
  const [open, setOpen] = useState(false);

  function handleDelete() {
    axios.delete(`http://localhost:8080/api/users/delete/${decodedId}`)
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
    navigate("/register")
  }

  const toggle = () => setOpen(!open);

  return (
    <div>
        <Button color="danger" onClick={toggle}>
          Delete Account
        </Button>
      <Modal returnFocusAfterClose={true} isOpen={open}>
        <ModalBody>
          Are you sure you would like to delete your account?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Yes
          </Button>
          <Button color="primary" onClick={toggle}>
            No
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default DeleteModal;
