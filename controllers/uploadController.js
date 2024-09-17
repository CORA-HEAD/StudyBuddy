const path = require('path');
const { Course, Video, Category } = require('../models/associations');

class uploadController {

    // Render the upload form
    static async renderUploadForm(req, res) {
        try {
            // Fetch all categories from the database
            const categories = await Category.findAll();

            // Render the form with the fetched categories
            res.render('upload/videos', { categories, message: null, error: null });
        } catch (error) {
            console.error('Error rendering upload form:', error);
            res.status(500).send('Error rendering upload form');
        }
    }

    static  async uploadVideo (req, res) {
        try {
            const videoFile = req.files['video_file'] ? req.files['video_file'][0] : null;//start
            const imageFile = req.files['course_image'] ? req.files['course_image'][0] : null;

            if (!videoFile) {
                const categories = await Category.findAll();
                return res.render('upload/videos', { categories, message: null, error: 'No video file uploaded' });
            }

            const fileName = videoFile.filename;
            const imagePath = imageFile ? imageFile.filename : null;//this is addded end
            const { course_title, course_description, course_price, category_id, video_title, resolution, duration, level } = req.body;
            const newCourse = await Course.create({
                title: course_title,
                description: course_description,
                price: parseFloat(course_price) || 0.00,
                level: level,
                category_id: category_id,
                image_path: imagePath ? `/uploads/${imagePath}` : null // Store image path if uploaded
            });

            // Create a new video linked to the newly created course
            const newVideo = await Video.create({
                course_id: newCourse.course_id,
                title: video_title || fileName, // Use provided title or filename
                file_path: `/uploads/${fileName}`,
                resolution: resolution || null,
                format: path.extname(fileName).replace('.', ''),
                duration: duration || null
            });

            // Redirect to the success page
            return res.redirect(`/admin/videos/success/${newVideo.video_id}`);
        } catch (error) {
            console.error('Error while uploading video and creating course:', error);
            const categories = await Category.findAll();
            return res.render('upload/videos', { categories, message: null, error: 'Error while uploading video and creating course' });
        }
    }

    static async uploadSuccess (req, res){
        try {
            const videoId = req.params.id;

            // Fetch the video details along with the associated course details (if any)
            const video = await Video.findOne({
                where: { video_id: videoId },
                include: [{ model: Course, as: 'course' }]
            });

            if (!video) {
                return res.render('upload/uploadError', { message: 'Video not found', error: null });
            }

            // Render the success page with the video details
            res.render('upload/uploadSuccess', { video });
        } catch (error) {
            console.error('Error fetching video details:', error);
            res.render('upload/uploadError', { message: 'Error fetching video details', error: error.message });
        }
    }

    // Get all videos

    static async getAllVideos(req, res){
        try {
            const videos = await Video.findAll({
                include: [
                    {
                        model: Course,
                        as: 'course',
                        include: [{ model: Category, as: 'category' }]
                    }
                ],
                order: [['created_at', 'DESC']]
            });
    
            res.render('upload/allVideos', { videos, message: null, error: null });
        } catch (error) {
            console.error('Error while retrieving videos:', error);
            res.status(500).send('Error while retrieving videos');
        }
    }
}
module.exports=uploadController;

