import React, { useEffect, useState } from "react";
import { PhotoGrid } from "../../components/PhotoGrid";
import { PlaceInfo } from "../../components/PlaceInfo";
import { Rating } from "../../components/Rating";
import "./PlaceCard.css";

const PlaceCard = ({ place }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/comments/${place.id}`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
      }
    };

    fetchComments();
  }, [place.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) {
      setError('Введіть текст коментаря');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Ви повинні бути авторизовані щоб залишити коментар');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/comments/${place.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.msg || 'Помилка при відправленні коментаря');
        return;
      }

      const newComment = await response.json();
      setComments([...comments, newComment]);
      setText('');
    } catch (error) {
      setError('Помилка при доданні коментаря');
      console.error('Помилка при доданні коментаря', error);
    }
  };

  return (
    <div className="place-card">
      <PhotoGrid photos={place.photos} />
      <PlaceInfo name={place.name} description={place.description} />
      <Rating rating={place.rating} />

      <div className="comments-section">
        <h3>Коментарі</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Залишити коментар"
          />
          <button type="submit">Відправити</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
          {comments.map(comment => (
            <li key={comment._id}>
              <p>{comment.text}</p>
              <small>{comment.user.name} ({comment.user.email}) - {new Date(comment.date).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlaceCard;
