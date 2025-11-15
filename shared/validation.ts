// Shared validation constants between server and client
// Keep these in sync with any zod schemas in server/routers.ts

export const SHOP_NAME_MIN = 3;
export const SHOP_NAME_MAX = 40;
export const DESCRIPTION_MAX = 500;
export const LOCATION_MAX = 60;
// Allowed: letters (incl. umlauts, ß), numbers, space, dot, comma, apostrophe, dash
export const SHOP_NAME_REGEX = /^[A-Za-z0-9ÄÖÜäöüß .,'-]+$/;

export const SHOP_NAME_ALLOWED_CHARS_HINT = "Buchstaben, Zahlen, Leerzeichen sowie . , ' -";
