// src/components/PhotoGrid/PhotoGrid.jsx
import React, { useState } from "react";
import Modal from "react-modal";
import "./PhotoGrid.css";

Modal.setAppElement("#root");

const PhotoGrid = ({ photos }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const safePhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];
  if (safePhotos.length === 0) return null;

  const main = safePhotos[0];
  const thumbs = safePhotos.slice(1, 4);     // максимум 3
  const extra = Math.max(0, safePhotos.length - 4);

  const openModal = (photo) => {
    setCurrentPhoto(photo);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentPhoto(null);
  };

  return (
    <div
      className="photo-grid"
      style={{ "--thumbs": Math.max(1, thumbs.length) }}
    >
      {main && (
        <button
          type="button"
          className="main-photo"
          onClick={() => openModal(main)}
        >
          <img src={main} alt="main" loading="lazy" />
        </button>
      )}

      <div className="sub-photos">
        {thumbs.map((photo, index) => {
          const isLast = index === thumbs.length - 1;
          const showMore = isLast && extra > 0;

          return (
            <button
              type="button"
              key={photo + index}
              className={`sub-photo ${showMore ? "has-more" : ""}`}
              onClick={() => openModal(photo)}
            >
              <img src={photo} alt={`thumb-${index}`} loading="lazy" />
              {showMore && <span className="more-badge">+{extra}</span>}
            </button>
          );
        })}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className="modal"
        overlayClassName="overlay"
        shouldCloseOnOverlayClick
      >
        <button
          type="button"
          onClick={closeModal}
          className="modal-close"
          aria-label="Close"
        >
          ✕
        </button>

        {currentPhoto && (
          <img src={currentPhoto} alt="modal" className="modal-image" />
        )}
      </Modal>
    </div>
  );
};

export default PhotoGrid;
