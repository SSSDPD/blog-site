import { RegisterUserArgument } from "src/resolvers/user";

export const validateRegister = (register_args: RegisterUserArgument) => {
    if (register_args.password.length <= 2) {
        return [
            {
              field: "password",
              message: "length must be greater than 2",
            },
          ];
      }
  
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(register_args.email)){
        return[
            {
              field: 'email',
              message: 'Invalid email'
            }
          ];
      }
  
      if (register_args.username.length <= 2) {
        return [
            {
              field: "username",
              message: "length must be greater than 2",
            },
          ];
      } 

      return null;
}