const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error('🔥 Error:', err.message);
    if (err.stack) console.error(err.stack);

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};

export default errorHandler;