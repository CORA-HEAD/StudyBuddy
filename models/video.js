const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const Video = sequelize.define('Video', {
    video_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'courses',
            key: 'course_id'
        },
        onDelete: 'CASCADE',
        allowNull: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    resolution: {
        type: DataTypes.STRING,
        allowNull: true
    },
    format: {
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'videos',
    timestamps: false
});
module.exports = Video;
