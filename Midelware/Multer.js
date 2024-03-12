import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Public')
    },
    filename: function (req, file, cb) {
     
      cb(null, file.fieldname)
    }
  })
  
 export const Upload = multer({ storage: storage })

