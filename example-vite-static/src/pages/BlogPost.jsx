import PropTypes from 'prop-types';

export default function BlogPost({ routerinoParams }) {
  return (
    <div>
      <h1>Blog Post {routerinoParams?.id}</h1>
      <p>This is a dynamic route that won&apos;t be statically generated.</p>
    </div>
  );
}

BlogPost.propTypes = {
  routerinoParams: PropTypes.shape({
    id: PropTypes.string
  })
};