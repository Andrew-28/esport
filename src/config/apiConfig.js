// src/config/apiConfig.js

// Базова адреса API. На деві це localhost, на проді — твій домен.
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * Цей невеликий модуль дозволяє:
 * - не дублювати рядок 'http://localhost:5000' по всьому проєкту;
 * - легко перемикатися між dev/stage/prod через змінні середовища;
 * - описати в дипломі розділення конфігурації за середовищами (12-factor app).
 */
