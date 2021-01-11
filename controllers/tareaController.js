const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const {validationResult} = require('express-validator');

//crear uina nueva tarea
exports.crearTarea = async(req, res) => {
    //reisar si hay errores 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errores: errors.array()})
    }
    
    try {
        //extrear el proyecto y comprobar si existe
        const {proyecto} = req.body;

        const existeProyecto = await Proyecto.findById(proyecto);
        if (!existeProyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }
        //verficiar el creador del proyecto
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'})
        }
        //creamos la tarea
        const tarea = new Tarea(req.body);
        await tarea.save();
        res.json({tarea});
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }

}

//obtiene las tareas cpor proyecto
exports.obtenerTareas = async(req, res) => {

    try {
        //extrear el proyecto y comprobar si existe
        const {proyecto} = req.query; // query por q se esta enviando el proyecto por 'params' desde el front

        const existeProyecto = await Proyecto.findById(proyecto);
        if (!existeProyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'});
        }
        //verficiar el creador del proyecto
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'})
        }

        //obtener las taeras por proyecto
        const tareas = await Tarea.find({ proyecto }).sort({creado: -1});
        res.json({tareas})

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

//Actualizar una tarea
exports.actualizarTarea = async(req, res) =>{
    try {
        //extrear el proyecto y comprobar si existe
        const {proyecto, nombre, estado} = req.body;

        //si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(401).json({msg: 'No existe esa tarea'});
        }

        //extraer proyecto
        const existeProyecto = await Proyecto.findById(proyecto);

        //verficiar el creador del proyecto
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'})
        }

        //crear un objeto con la nueva información
        const nuevaTarea = {};
        nuevaTarea.nombre = nombre;
        nuevaTarea.estado = estado;

        //Guardar tarea
        tarea = await Tarea.findOneAndUpdate({_id : req.params.id}, nuevaTarea, { new: true});
        res.json({ tarea })

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }
}

exports.eliminarTarea = async(req, res) =>{
    try {
        //extrear el proyecto y comprobar si existe
        const {proyecto} = req.query;
        //si la tarea existe o no
        let tarea = await Tarea.findById(req.params.id);

        if (!tarea) {
            return res.status(401).json({msg: 'No existe esa tarea'});
        }

        //extraer proyecto
        const existeProyecto = await Proyecto.findById(proyecto);

        //verficiar el creador del proyecto
        if (existeProyecto.creador.toString() !== req.usuario.id) {
            return res.status(401).json({msg: 'No Autorizado'})
        }

        //eliminar 
        await Tarea.findOneAndRemove({_id: req.params.id});
        res.json({ msg: 'Tarea Eliminada' });

    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error');
    }   
}