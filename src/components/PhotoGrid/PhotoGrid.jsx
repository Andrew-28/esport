import React, { useState } from "react";
import Modal from "react-modal";
import "./PhotoGrid.css";

Modal.setAppElement("#root");

const PhotoGrid = ({ photos }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const openModal = (photo) => {
    setCurrentPhoto(photo);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentPhoto(null);
  };

  return (
    <div className="photo-grid">
      <div className="main-photo" onClick={() => openModal(photos[0])}>
        <img src={photos[0]} alt="main" />
      </div>
      <div className="sub-photos">
        {photos.slice(1).map((photo, index) => (
          <div
            key={index}
            className="sub-photo"
            onClick={() => openModal(photo)}
          >
            <img src={photo} alt={`sub-${index}`} />
          </div>
        ))}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className="modal"
        overlayClassName="overlay"
      >
        {currentPhoto && (
          <img src={currentPhoto} alt="modal" className="modal-image" />
        )}
        <button onClick={closeModal} className="close-button">
          Close
        </button>
      </Modal>
    </div>
  );
};

export default PhotoGrid;
