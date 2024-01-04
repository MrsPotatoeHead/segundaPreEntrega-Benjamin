
import { UserService } from "../services/services.js"

export const updatedUserRoleController = async (req, res) => {
    try {
        const email = req.params.email;
        const user = await UserService.findUser({email})
        //console.log('user dentro de update', user)

        if (!user) {return res.status(404).json({error: "Usuario no encontrado"})}

       
        if (user.role === "admin" || user.role === "premium") {
            return res.status(409).json({code: 1, error: "El usuario ya es premium o un administrador"}) 
        }

        const rolePremium = "premium"

        const updatedUser = await UserService.findAndUpdate(user._id, {role: rolePremium})
        //console.log('useracutializado', updatedUser)
        res.status(201).json({ status: "success", message: "Rol de usuario actualizado con éxito", payload: updatedUser })

    } catch (err) {
        logger.error("Error al actualizar el rol del usuario", err.message)
        res.status(500).json({ error: err.message });
    }
}

