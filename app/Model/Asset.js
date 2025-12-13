module.exports=(sequelize,DataTypes)=>{
    const Asset=sequelize.define('Asset',{
     id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: 'unique_id' 
    },
     categoryId:{
       type: DataTypes.INTEGER,
        allowNull:false,
   
     },
         name: {
        type: DataTypes.STRING,
        allowNull: false,
        
      },
      serialNumber:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
      },
  

      status:{
    type: DataTypes.ENUM('IN_STOCK', 'ISSUED', 'SCRAPPED', 'UNDER_REPAIR'),
    defaultValue: 'IN_STOCK'

      },
       currentEmployeeId:{
       type:DataTypes.STRING,
       allowNull:true
       }

    },{
  timestamps:true,
  tableName:'Asset'

    });

    return Asset;
}