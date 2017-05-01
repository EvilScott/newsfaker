# newsfaker
### generating headlines via markov from fake news

Data from https://www.kaggle.com/mrisdal/fake-news // Use `$ docker-compose up && open http://localhost:4000` to 
view (it will take a few seconds)

### TODO
- Make dictionary generation a separate process
- Multiple instances balanced by nginx
- Bigger markov prefix
- Adjust terms for special cases like "RE:" and keeping internal apostrophes
- Random image
- More styling (all uppercase?)
