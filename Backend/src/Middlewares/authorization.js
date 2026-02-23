/**
 * Authorization middleware for checking if `apikey` is valid
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export default function authorize(req, res, next) {
  const apikey = req.headers.apikey;

  console.log(apikey);

  if (!apikey || (apikey && apikey !== process.env.API_KEY)) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized!",
    });
  }

  next();
}
