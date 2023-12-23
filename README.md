To get started with the Beck Snap Food project, follow these steps:

Clone the Repository:

git clone https://github.com/mirzaeeWork/beck_snap_food.git
cd beck_snap_food

Install Dependencies:
npm i
Create .env File:
Create a file named .env in the project root and set the following variables:

env
Copy code
Port=<port_number>            # Port for the local host
SECRET_KEY=<your_secret_key>  # Secret key for jsonwebtoken
Api_Key_Neshon=<api_key>      # Api key for latitude and longitude (register on the site neshan)
hashCheckOwner=<hashed_value> # Hashed value known only to the store owner
Run the Project:
Open two terminals and run the following commands:
Terminal 1:
npm run ts
Terminal 2:
npm run dev

This will compile the TypeScript code in one terminal and run the development server in the other.
