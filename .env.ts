const MONGO_URI = process.env.MONGO_URI || '';
mongoose.connect(mongodb+srv://abhiram:MySecurePass123@cluster0.mongodb.net/chatbot?retryWrites=true&w=majority).then(() => console.log('✅ MongoDB connected'));
