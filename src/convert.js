const PDFDocument = require('pdfkit');

const fs = require('fs');
const sizeOf = require('image-size');
const path = require('path')

const convertToPdf = async (fileNames) => {

    return new Promise(async (resolve, reject) => {
        try {
            let doc = undefined
            let counter = 0;
            const pathUrl = '/pdfs'+"/combined-" + makeid(5) + "-"+Date.now() + '.pdf'
            const writeFilePath = path.join(__dirname, '..', '/public', pathUrl)

            for (const fileName of fileNames) {

                const readFilePath = path.join(__dirname, '..', '/public/images', fileName)
                console.log({ readFilePath });
                const size = await sizeOf(readFilePath);
                const imageSize = [size.width, size.height]

                if (counter == 0) {
                    doc = new PDFDocument({ size: imageSize })
                    doc.pipe(fs.createWriteStream(writeFilePath));
                }
                else {
                    doc.addPage({ size: imageSize });
                }
                doc.image(readFilePath, 0, 0, { width: imageSize.width, height: imageSize.height })
                counter++;
            }
            doc.end();
            resolve(pathUrl)

        } catch (error) {
            reject(error)
        }
    })
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = convertToPdf