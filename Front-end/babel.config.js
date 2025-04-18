module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-react", { runtime: "automatic" }], // ✅ thêm dòng này
  ],
};
