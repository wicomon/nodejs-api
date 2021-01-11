const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.crearUsuario = async(req, res) => {

    //reisar si hay errores 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errores: errors.array()})
    }

    //extraer el email y password
    const {email, password} = req.body;

    try {
        let usuario = await Usuario.findOne({email});

        if (usuario) {
            return res.status(400).json({msg: 'el usuario ya existe'});
        }
        //crear el objeto de usuario
        usuario = new Usuario(req.body);

        //hashear el password
        const salt = await bcryptjs.genSalt(10);
        usuario.password= await bcryptjs.hash(password, salt)

        //guardar usuario
        await usuario.save();

        //crear y firmar el JWT
        const payload = {
            usuario : {
                id: usuario.id
            }
        };
        //firmar el jwt
        jwt.sign(payload, process.env.SECRETA, {
            expiresIn: 3600
        }, (error, token) => {
            if (error) throw error;

            //mensaje de confirmacion
            res.json({token});
        });

        //mensaje de confirmacion 
        // res.json({msg: 'Usuario creado correctamente'});
    } catch (error) {
        console.log(error);
        res.status(400).send('hubo un error');
    }
}