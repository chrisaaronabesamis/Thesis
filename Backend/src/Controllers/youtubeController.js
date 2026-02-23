import youtubeService from '../services/youtubeService.js';

class YouTubeController {
  async getBINIVideos(req, res) {
    try {
      const videos = await youtubeService.getBINIVideos();
      res.json({
        success: true,
        data: videos,
        message: 'BINI videos retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  async getPopularBINIVideos(req, res) {
    try {
      const videos = await youtubeService.getPopularBINIVideos();
      res.json({
        success: true,
        data: videos,
        message: 'Popular BINI videos retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  async getVideoDetails(req, res) {
    try {
      const { videoId } = req.params;
      
      if (!videoId) {
        return res.status(400).json({
          success: false,
          message: 'Video ID is required',
          data: null
        });
      }

      const videoDetails = await youtubeService.getVideoDetails(videoId);
      res.json({
        success: true,
        data: videoDetails,
        message: 'Video details retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  async getBannerVideos(req, res) {
    try {
      // Get 5 specific videos for the banner carousel
      const popularVideos = await youtubeService.getPopularBINIVideos();
      
      // Format for frontend banner carousel
      const bannerVideos = popularVideos.slice(0, 5).map((video, index) => ({
        id: index,
        videoId: video.videoId,
        title: YouTubeController.extractTitle(video.title),
        subtitle: 'Official Music Video',
        thumbnail: video.thumbnail,
        publishedAt: video.publishedAt
      }));

      res.json({
        success: true,
        data: bannerVideos,
        message: 'Banner videos retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null
      });
    }
  }

  static extractTitle(title) {
    // Extract clean title from YouTube video title
    const cleanTitle = title.replace(/official music video|mv|official video/gi, '').trim();
    return cleanTitle || title;
  }
}

export default new YouTubeController();
