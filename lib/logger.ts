type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

function write(level: LogLevel, message: string, fields?: LogFields): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info(message: string, fields?: LogFields): void {
    write("info", message, fields);
  },
  warn(message: string, fields?: LogFields): void {
    write("warn", message, fields);
  },
  error(message: string, fields?: LogFields): void {
    write("error", message, fields);
  },
};
