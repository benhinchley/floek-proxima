const enforceHTTPS = (req, res, next) => {
  if (req.get("X-Forwarded-Proto") === undefined) return next();

  if (req.get("X-Forwarded-Proto").indexOf("https") != -1) {
    return next();
  } else {
    res.redirect("https://" + req.hostname + req.url);
  }
};

module.exports = {
  enforceHTTPS
};
