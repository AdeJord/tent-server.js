import pool from "../dbConfig.js";
import path from "path";

// function to add news
export const addNews = async (request, response) => {
  const {
    title,
    content,
    date = new Date().toISOString(),
  } = request.body;
  const image = request.file;  // This is where multer stores the file information

  console.log("Title:", title);
  console.log("Content:", content);
  console.log("Date:", date);
  console.log("Image Info:", image);

  try {
    // Correctly format the image path using path.join
    const imagePath = image ? path.join('/var/www/uploads/news-images', image.filename) : null; // Store the web accessible path
    const query = `
      INSERT INTO news
      (title, content, image_path, date)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    const values = [title, content, imagePath, date];
    const result = await pool.query(query, values);
    console.log(`News added with ID: ${result.rows[0].id}`);
    response.status(201).json({ message: `News added with ID: ${result.rows[0].id}` });
  } catch (error) {
    console.error("Error creating news:", error);
    response.status(500).json({
      error: "Internal Server Error try again and call Ade if not working",
    });
  }
};

// function to get all news
export const getAllNews = async (request, response) => {
  pool.query("SELECT * FROM news ORDER BY date DESC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// function to get news by ID
export const getNewsById = async (request, response) => {
  const id = parseInt(request.params.newsId);

  try {
    const result = await pool.query("SELECT * FROM news WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      response.status(404).json({ error: `News with ID ${id} not found` });
    } else {
      response.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error("Error getting news by ID:", error);
    response
      .status(500)
      .json({
        error: "Internal Server Error try again and call Ade if not working",
      });
  }
};

//get latest news for homepage on website
export const getLatestNews = async (request, response) => {
  try {
    const result = await pool.query("SELECT * FROM news ORDER BY date DESC LIMIT 1");
    response.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting latest news:", error);
    response
      .status(500)
      .json({
        error: "Internal Server Error try again and call Ade if not working",
      });
  }
}

// function to delete news by ID
export const deleteNews = async (request, response) => {
  const id = parseInt(request.params.newsId);

  try {
    const result = await pool.query("DELETE FROM news WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      response.status(404).json({ error: `News with ID ${id} not found` });
    } else {
      response
        .status(200)
        .json({ message: `News with ID ${id} deleted successfully` });
    }
  } catch (error) {
    console.error("Error deleting news by ID:", error);
    response
      .status(500)
      .json({
        error: "Internal Server Error try again and call Ade if not working",
      });
  }
};

// function to update news by ID
export const updateNews = async (request, response) => {
  const id = parseInt(request.params.newsId);
  const { title, content, image_path, date } = request.body;

  try {
    const query = `
      UPDATE news
      SET title = $1, content = $2, date = $3, image_path = $4
      WHERE id = $5
      RETURNING *`;
    const values = [title, content, date, image_path, id]; // Ensure correct order
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {  // Changed from result.rows.length to result.rowCount
      response.status(404).json({ error: `News with ID ${id} not found` });
    } else {
      response.status(200).json({ message: `News with ID ${id} updated successfully`, news: result.rows });
    }
  } catch (error) {
    console.error("Error updating news by ID:", error.stack);
    response.status(500).json({
      error: "Internal Server Error. Please try again and contact Ade if the issue persists.",
      dbError: error.message  // More specific error message
    });
  }
};
