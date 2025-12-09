-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Ноя 24 2025 г., 11:59
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `studentbiz_db`
--

-- --------------------------------------------------------

--
-- Структура таблицы `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `last_login`, `created_at`) VALUES
(1, 'admin', '$2y$10$VfzjBXLaD4v9oUlTWeTpCuyT8oNNNjFGKNovIRvR/N/AeCpMOyeoG', '2025-11-23 13:44:16', '2025-11-23 12:59:57');

-- --------------------------------------------------------

--
-- Структура таблицы `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `college` varchar(200) NOT NULL,
  `idea` text NOT NULL,
  `status` enum('new','reviewed','accepted') DEFAULT 'new',
  `created_at` datetime DEFAULT current_timestamp(),
  `full_data` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `applications`
--

INSERT INTO `applications` (`id`, `full_name`, `email`, `college`, `idea`, `status`, `created_at`, `full_data`) VALUES
(1, 'Edgargevorgyan', 'edgargevorgyan988@gmail.com', 'Yerevan State College of Informatics', 'ывафаывафы фывафыва фыва', 'new', '2025-11-23 15:14:44', NULL),
(2, 'Edgargevorgyan', 'edgargevorgyan988@gmail.com', 'Yerevan State College of Informatics', 'menq uzum enq stexcel mi biznes vortex miban anum en', 'new', '2025-11-23 15:26:20', '{\"school_name\":\"Yerevan State College of Informatics\",\"address\":\"16 Taxamas\",\"mentor_name\":\"Edgargevorgyan\",\"mentor_position\":\"asd\",\"mentor_phone\":\"095551348\",\"mentor_email\":\"edgargevorgyan988@gmail.com\",\"director_name\":\"Robert Abrahamyan\",\"director_phone\":\"099084498\",\"director_email\":\"blackgonza1@gmail.com\",\"school_type\":\"high\",\"team_name_1\":\"Edgar gevorgyan\",\"team_class_1\":\"316\",\"team_role_1\":\"Tnoren\",\"team_name_2\":\"Bdeshx bdeshxyan\",\"team_class_2\":\"316\",\"team_role_2\":\"miban\",\"company_name\":\"BlackGonza\",\"idea_desc\":\"menq uzum enq stexcel mi biznes vortex miban anum en\",\"direction\":\"production\",\"direction_other\":\"\",\"goals\":\"npatakne harstanal\",\"users\":\"sovorakan mardik\",\"impact\":\"chgidem\",\"roles_plan\":\"chgidem hly vor\",\"action_plan\":\"noyemberin kstexcenq team\",\"resources\":\"pox pox u pox\",\"signature_name\":\"Edgar Gevorgyan\",\"agreement\":\"on\"}');

-- --------------------------------------------------------

--
-- Структура таблицы `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `event_date` date NOT NULL,
  `type` enum('event','deadline') DEFAULT 'event'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `events`
--

INSERT INTO `events` (`id`, `title`, `event_date`, `type`) VALUES
(1, 'Startup Grind Yerevan', '2025-11-24', 'event'),
(2, 'Business Model Workshop', '2025-12-02', 'event'),
(3, 'Deadline: Submit Papers', '2025-11-28', 'deadline');

-- --------------------------------------------------------

--
-- Структура таблицы `gallery`
--

CREATE TABLE `gallery` (
  `id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT 'mixed',
  `media_url` longtext DEFAULT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `gallery`
--

INSERT INTO `gallery` (`id`, `type`, `media_url`, `caption`, `created_at`) VALUES
(1, 'mixed', '[{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668a7ef.png\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668a93d.png\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668ab64.jpg\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668ade4.jpg\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668aeef.jpg\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668b07e.jpg\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668b207.jpg\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668b3f2.jpg\"},{\"type\":\"photo\",\"url\":\"uploads\\/gallery\\/gallery_1763900518_6922fc668b56f.jpg\"}]', 'ALbom 1', '2025-11-23 16:21:58');

-- --------------------------------------------------------

--
-- Структура таблицы `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `content` text NOT NULL,
  `publish_date` date DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Индексы таблицы `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `gallery`
--
ALTER TABLE `gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
