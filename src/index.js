import express from "express";
const app = express();
import bodyParser, { json } from "body-parser";
import Exceljs from "exceljs";
import fs from "fs";
import path from "path";
import fileUpload from "express-fileupload";
import xlsxtojson from "xlsx-to-json";
import XLSX, { read } from "xlsx";
import csvtojson from "csvtojson";
//const fileUpload = require("express-fileupload");
//*config
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/uploads/"
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
const directoryPath = path.join(__dirname, "uploads");
const directoryOut = path.join(__dirname, "outputs");
const transformedJson = path.join(__dirname, "transformed");
app.use(function(req, res, next) {
  //allow cross origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Max-Age", "3600");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
  );
  next();
});
//todo convertir a una clase para manejar metodos independientes
//todo historico de sion revisar
//* este endpoint se probo con filesystem y exceljs

app.post("/convertion1", (req, res) => {
  let hojaFile = req.files.file;
  console.log(hojaFile);
  //* recibir el archivo y enviarlo a carpeta uploads
  const guardaArchivo = file => {
    return new Promise((resolve, reject) => {
      //setTimeout(resolve, 2000, "has guardado y movido");
      if (file.name === "") {
        reject(new Error("Fallo lectura"));
      } else {
        file.mv(`src\\uploads\\${file.name}`, err => {
          if (err) {
            console.log(err);
          }
          resolve(file.name);
        });
      }
    });
  };
  const writeToCvs = name => {
    console.log(name, "in writetocvs");
    let workbook;
    return new Promise((resolve, reject) => {
      if (`${directoryPath}\\${name}` === "") {
        reject(new Error("No se puede leer el directorio"));
      } else {
        workbook = XLSX.readFile(`${directoryPath}\\${name}`);
        let reading = workbook =>
          // resolve(
          XLSX.writeFile(workbook, `${directoryOut}\\outxt`, {
            bookType: "csv"
          });
        //  );
        resolve(`${directoryOut}\\outxt`);
        reading(workbook);
      }
    });
  };
  const createJason = toRead => {
    console.log(toRead, "en create json");
    return new Promise((resolve, reject) => {
      if (`${toRead}` === "") {
        reject(new Error("no se puede leer el csv "));
      } else {
        csvtojson()
          .fromFile(`${toRead}`)
          .then(source => {
            let data = JSON.stringify(source, null, 2);
            console.log("guardando data en json.....");
            fs.writeFileSync(`${transformedJson}\\transformed.json`, data);
            fs.readdir(`${transformedJson}`, (err, lect) => {
              if (err) {
                console.log("error al leer el directorio de JSON 🤕");
              } else {
                console.log("Json creado con exito 🔥 💀", lect);
              }
            });
          })
          .catch(err => {
            console.log(err.message);
          });
      }
    });
  };

  async function allWork() {
    const primeraAccion = await guardaArchivo(hojaFile);
    console.log(primeraAccion, "primera accion guardar");
    const segundaAccion = await writeToCvs(primeraAccion);
    console.log(segundaAccion, "segunda accion leer uploads");
    const terceraAccion = await createJason(segundaAccion);
    console.log(terceraAccion, " ahora tienes un json para leer");
  }
  allWork();
});

app.listen(4200, () => {
  console.log(`listen on port 4200 ready!!🔥🚀`);
});
