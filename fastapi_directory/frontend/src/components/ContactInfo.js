import React from "react";
import { Typography, List, ListItem, ListItemText, Box } from "@mui/material";

const contacts = [
  {
    department: "Служба поддержки",
    phone: "+7 (495) 123-45-67",
    description: "Помощь с техническими вопросами и консультации",
  },
  {
    department: "Отдел продаж",
    phone: "+7 (495) 234-56-78",
    description: "Вопросы по заказам и коммерческим предложениям",
  },
  {
    department: "Техническая поддержка",
    phone: "+7 (495) 345-67-89",
    description: "Решение технических проблем и сопровождение",
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
