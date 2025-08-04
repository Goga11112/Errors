import React from "react";
import { Typography, List, ListItem, ListItemText, Box } from "@mui/material";

const contacts = [
  {
    department: "Служба поддержки",
    phone: "3333",
    description: "Помощь с техническими вопросами и консультации",
  },
  {
    department: "Гладышев Александр Викторович",
    phone: "1790",
    description: "Вопросы по работе приложения и видения заявок",
  },
  {
    department: "Гаврилов Егор Витальевич",
    phone: "2377",
    description: "Техническая поддержка",
  },
  {
    department: "Мищенко Даниил Витальевич",
    phone: "2268",
    description: "Техническая поддержка",
  },
];

function ContactInfo() {
  return (
    <Box sx={{ padding: 2, backgroundColor: '#2a2f4a', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#f2a365' }}>
        Контактная информация
      </Typography>
      <List>
        {contacts.map((contact, index) => (
          <ListItem key={index} alignItems="flex-start" disablePadding>
            <ListItemText
              primary={`${contact.department} — ${contact.phone}`}
              secondary={contact.description}
              sx={{ whiteSpace: 'normal', color: '#eaeaea' }}
              primaryTypographyProps={{ sx: { color: '#f2a365' } }}
              secondaryTypographyProps={{ sx: { color: '#84a59d' } }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default ContactInfo;
