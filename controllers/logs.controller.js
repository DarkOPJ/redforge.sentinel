import { logger } from "../utils/logger.js";

/**
 * SSE Controller: Streams logs to the client in real-time.
 * Accessible at GET /logs/stream
 */
const stream_logs = (req, res) => {
  // Set headers for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Function to format and send the log to the client
  const onLog = (info) => {
    // We send the log as a JSON string in the 'data' field
    res.write(`data: ${JSON.stringify(info)}\n\n`);
  };

  // Subscribe to the 'log' event from our winston logger
  logger.on("data", onLog);

  // Send a heartbeat to keep the connection alive (optional but recommended)
  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  // Clean up when the client disconnects
  req.on("close", () => {
    clearInterval(heartbeat);
    logger.removeListener("data", onLog);
    res.end();
  });
};

export { stream_logs };
