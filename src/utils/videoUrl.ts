// export const getEmbedUrl = (url: string) => {
//   if (!url) return "";

//   const trimmed = url.trim();

//   // YOUTUBE
//   if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be")) {
//     const match =
//       trimmed.match(/v=([^&]+)/) || trimmed.match(/youtu\.be\/([^?&]+)/);

//     const videoId = match?.[1];
//     if (videoId) {
//       return `https://www.youtube.com/embed/${videoId}`;
//     }
//   }

//   // DAILYMOTION
//   if (trimmed.includes("dailymotion.com")) {
//     return `${trimmed}${trimmed.includes("?") ? "&" : "?"}autoplay=1`;
//   }

//   // GOOGLE DRIVE
//   if (trimmed.includes("drive.google.com")) {
//     const match = trimmed.match(/\/d\/([^/]+)/);
//     if (match?.[1]) {
//       return `https://drive.google.com/file/d/${match[1]}/preview`;
//     }
//     return trimmed.replace("/view", "/preview");
//   }

//   return trimmed;
// };
