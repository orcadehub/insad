import { Card, CardContent, CardActions, Typography } from '@mui/material';

const CustomCard = ({ title, children, actions, className = '' }) => {
  return (
    <Card className={`card-hover ${className}`}>
      {title && (
        <CardContent className="pb-2">
          <Typography variant="h6" className="font-semibold">
            {title}
          </Typography>
        </CardContent>
      )}
      
      <CardContent className={title ? 'pt-0' : ''}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions className="px-4 pb-4">
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default CustomCard;