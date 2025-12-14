// src/components/PhotoGrid/PhotoGrid.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import "./PhotoGrid.css";

Modal.setAppElement("#root");

const PhotoGrid = ({ photos }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const safePhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];

  if (safePhotos.length === 0) {
    return null; // або можна показати плейсхолдер
  }

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
      {safePhotos[0] && (
        <div className="main-photo" onClick={() => openModal(safePhotos[0])}>
          <img src={safePhotos[0]} alt="main" />
        </div>
      )}
      <div className="sub-photos">
        {safePhotos.slice(1).map((photo, index) => (
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
