// CineTrack Configuration
export const WORKER_URL = "https://cinetrack-tmdb.official-ronit-codewizard.workers.dev";
export const API_BASE = WORKER_URL;
export const APP_NAME = "CineTrack";
export const VERSION = "1.0";
export const GITHUB_REPO = "Ronit-CodeWizard/CineTrack";
export const GITHUB_URL = "https://github.com/Ronit-CodeWizard/";
export const LOGO_PNG = "https://i.supaimg.com/92f82b8e-0941-4720-9455-b7257d1262f2/ffb48d88-03bf-4eea-9a7d-ecf7a7e992bb.png";
export const LOGO_SVG = "https://i.supaimg.com/92f82b8e-0941-4720-9455-b7257d1262f2/5c5496e7-615c-4f2b-9ef7-29b658ecc54f.svg";

if (typeof window !== "undefined") {
  window.CINETRACK_CONFIG = {
    API_BASE,
    WORKER_URL,
    APP_NAME,
    VERSION,
    GITHUB_REPO,
    GITHUB_URL,
    LOGO_PNG,
    LOGO_SVG,
  };
}

export default {
  API_BASE,
  WORKER_URL,
  APP_NAME,
  VERSION,
  GITHUB_REPO,
  GITHUB_URL,
  LOGO_PNG,
  LOGO_SVG,
};
