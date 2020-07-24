const handleErrorMessage = (err, res) => {
    res.status(err.response?.status ? err.response.status : 500).json({
        error: err.response?.message ? err.response.message : err.message,
    })
}

export default handleErrorMessage
